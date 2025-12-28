const Appointment = require('../models/Appointment');
const DoctorAvailability = require('../models/DoctorAvailability');
const User = require('../models/User');

/**
 * AI-Powered Appointment Recommendation Service
 * Analyzes patient needs and suggests optimal booking slots
 */

class SmartSchedulerService {
    /**
     * Get intelligent appointment recommendations
     * @param {Object} params - { patientId, condition, preferredDate, urgency }
     * @returns {Object} - Recommended slots and alternative doctors
     */
    async getRecommendations({ patientId, condition, preferredDate, urgency = 'normal' }) {
        try {
            // Step 1: Find doctors specializing in the condition
            const specialization = this.mapConditionToSpecialization(condition);
            const doctors = await User.find({
                role: 'doctor',
                specialization: { $regex: new RegExp(specialization, 'i') }
            }).select('name specialization rating experienceYears profileImage');

            if (doctors.length === 0) {
                return {
                    success: false,
                    message: 'No doctors found for this specialization'
                };
            }

            // Step 2: Sort doctors by AI scoring
            const scoredDoctors = await this.scoreDoctors(doctors, condition, urgency);

            // Step 3: Get available slots for top doctors
            const recommendations = [];

            for (const doctor of scoredDoctors.slice(0, 5)) {
                const availability = await DoctorAvailability.findOne({ doctor: doctor._id });

                if (!availability) continue;

                const slots = await this.generateAvailableSlots(
                    doctor._id,
                    availability,
                    preferredDate,
                    7 // Check next 7 days
                );

                if (slots.length > 0) {
                    recommendations.push({
                        doctor: {
                            _id: doctor._id,
                            name: doctor.name,
                            specialization: doctor.specialization,
                            rating: doctor.rating,
                            experienceYears: doctor.experienceYears,
                            profileImage: doctor.profileImage
                        },
                        aiScore: doctor.aiScore,
                        recommendedSlots: slots.slice(0, 5), // Top 5 slots
                        availabilityStatus: slots.length > 0 ? 'available' : 'limited',
                        reasonForRecommendation: doctor.reasonForRecommendation
                    });
                }
            }

            // Step 4: If primary doctors are full, suggest alternatives
            const primaryRecommendations = recommendations.filter(r => r.availabilityStatus === 'available');
            const alternativeRecommendations = recommendations.filter(r => r.availabilityStatus === 'limited');

            return {
                success: true,
                data: {
                    primaryRecommendations,
                    alternativeRecommendations: alternativeRecommendations.length > 0 ? alternativeRecommendations : await this.getAlternativeDoctors(specialization, preferredDate),
                    urgencyLevel: urgency,
                    aiInsights: this.generateAiInsights(condition, urgency, primaryRecommendations)
                }
            };
        } catch (error) {
            console.error('Smart Scheduler Error:', error);
            return {
                success: false,
                message: 'Failed to generate recommendations'
            };
        }
    }

    /**
     * Score doctors based on AI criteria
     */
    async scoreDoctors(doctors, condition, urgency) {
        const scored = doctors.map(doctor => {
            let score = 0;
            let reasons = [];

            // Rating weight (40%)
            score += (doctor.rating / 5) * 40;
            if (doctor.rating >= 4.5) reasons.push('Highly rated');

            // Experience weight (30%)
            const expScore = Math.min(doctor.experienceYears / 20, 1) * 30;
            score += expScore;
            if (doctor.experienceYears >= 10) reasons.push('Experienced specialist');

            // Specialization match (30%)
            if (doctor.specialization) {
                score += 30;
                reasons.push(`${doctor.specialization} expert`);
            }

            // Urgency boost
            if (urgency === 'high' && doctor.rating >= 4.5) {
                score += 10;
                reasons.push('Priority for urgent cases');
            }

            return {
                ...doctor._doc,
                aiScore: Math.round(score),
                reasonForRecommendation: reasons.join(', ')
            };
        });

        return scored.sort((a, b) => b.aiScore - a.aiScore);
    }

    /**
     * Generate available time slots for a doctor
     */
    async generateAvailableSlots(doctorId, availability, startDate, daysToCheck = 7) {
        const slots = [];
        const start = new Date(startDate || new Date());
        start.setHours(0, 0, 0, 0);

        for (let i = 0; i < daysToCheck; i++) {
            const checkDate = new Date(start);
            checkDate.setDate(start.getDate() + i);

            const dayOfWeek = checkDate.getDay();
            const dateStr = checkDate.toISOString().split('T')[0];

            // Check if date is blocked
            const isBlocked = availability.blockedDates.some(
                blocked => new Date(blocked.date).toISOString().split('T')[0] === dateStr
            );

            if (isBlocked) continue;

            // Find schedule for this day
            const daySchedule = availability.weeklySchedule.find(
                schedule => schedule.dayOfWeek === dayOfWeek && schedule.isActive
            );

            if (!daySchedule) continue;

            // Generate time slots
            const timeSlots = this.generateTimeSlots(
                daySchedule.startTime,
                daySchedule.endTime,
                daySchedule.slotDuration
            );

            // Check existing appointments
            for (const timeSlot of timeSlots) {
                const existingCount = await Appointment.countDocuments({
                    doctor: doctorId,
                    appointmentDate: checkDate,
                    appointmentTime: timeSlot,
                    status: { $in: ['pending', 'confirmed'] }
                });

                if (existingCount < daySchedule.maxPatientsPerSlot) {
                    slots.push({
                        date: dateStr,
                        time: timeSlot,
                        availableSpots: daySchedule.maxPatientsPerSlot - existingCount,
                        dayName: checkDate.toLocaleDateString('en-US', { weekday: 'long' }),
                        aiRecommended: this.isOptimalSlot(timeSlot, i)
                    });
                }
            }
        }

        return slots.sort((a, b) => {
            if (a.aiRecommended && !b.aiRecommended) return -1;
            if (!a.aiRecommended && b.aiRecommended) return 1;
            return 0;
        });
    }

    /**
     * Generate time slots between start and end time
     */
    generateTimeSlots(startTime, endTime, duration = 30) {
        const slots = [];
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        let currentMin = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        while (currentMin < endMinutes) {
            const hour = Math.floor(currentMin / 60);
            const min = currentMin % 60;
            slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
            currentMin += duration;
        }

        return slots;
    }

    /**
     * Determine if a time slot is optimal (AI criteria)
     */
    isOptimalSlot(timeSlot, daysFromNow) {
        const [hour] = timeSlot.split(':').map(Number);

        // Morning slots (9-11 AM) or afternoon (2-4 PM) are optimal
        const isOptimalTime = (hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16);

        // Sooner dates are better
        const isSoon = daysFromNow <= 3;

        return isOptimalTime && isSoon;
    }

    /**
     * Get alternative doctors if primary ones are unavailable
     */
    async getAlternativeDoctors(specialization, preferredDate) {
        const alternatives = await User.find({
            role: 'doctor',
            $or: [
                { specialization: { $regex: new RegExp(specialization, 'i') } },
                { specialization: 'General Physician' }
            ]
        }).limit(3);

        return alternatives.map(doc => ({
            doctor: {
                _id: doc._id,
                name: doc.name,
                specialization: doc.specialization,
                rating: doc.rating
            },
            message: 'Alternative specialist available'
        }));
    }

    /**
     * Map patient condition to medical specialization
     */
    mapConditionToSpecialization(condition) {
        const mapping = {
            'heart': 'Cardiology',
            'diabetes': 'Endocrinology',
            'skin': 'Dermatology',
            'bone': 'Orthopedics',
            'mental': 'Psychiatry',
            'child': 'Pediatrics',
            'pregnancy': 'Gynecology',
            'eye': 'Ophthalmology',
            'dental': 'Dentistry',
            'fever': 'General Physician',
            'cold': 'General Physician',
            'checkup': 'General Physician'
        };

        const lowerCondition = condition.toLowerCase();
        for (const [key, value] of Object.entries(mapping)) {
            if (lowerCondition.includes(key)) return value;
        }

        return 'General Physician';
    }

    /**
     * Generate AI insights for patient
     */
    generateAiInsights(condition, urgency, recommendations) {
        const insights = [];

        if (urgency === 'high') {
            insights.push('⚡ Urgent case detected - prioritizing experienced specialists');
        }

        if (recommendations.length === 0) {
            insights.push('⚠️ High demand detected - consider flexible timing');
        } else if (recommendations.length > 3) {
            insights.push('✅ Multiple specialists available - choose your preferred time');
        }

        const specialization = this.mapConditionToSpecialization(condition);
        insights.push(`🩺 Recommended specialty: ${specialization}`);

        return insights;
    }

    /**
     * Check for appointment conflicts
     */
    async detectConflicts(doctorId, appointmentDate, appointmentTime) {
        const conflicts = await Appointment.find({
            doctor: doctorId,
            appointmentDate: new Date(appointmentDate),
            appointmentTime: appointmentTime,
            status: { $in: ['pending', 'confirmed'] }
        }).populate('patient', 'name');

        return {
            hasConflict: conflicts.length > 0,
            conflicts: conflicts
        };
    }
}

module.exports = new SmartSchedulerService();
