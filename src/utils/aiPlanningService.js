/**
 * AI Planning Service (Advanced)
 * Analyzes production data based on user-defined weights and planning modes.
 */

export const calculatePriorityScore = (item, settings) => {
    let score = 0;
    let reasons = [];

    // Default weights if settings or priorities are missing
    const weights = settings?.aiPriorities || {
        vipWeight: 50,
        deadlineWeight: 40,
        overdueWeight: 30,
        complexityWeight: 10
    };

    const mode = settings?.aiMode || 'combined';

    // In 'manual' mode, AI weight is much lower, effectively just a suggestion
    const multiplier = mode === 'manual' ? 0.2 : 1.0;

    // 1. VIP status
    if (item.vip) {
        const val = weights.vipWeight * 2; // VIP is naturally more impactful
        score += val * multiplier;
        reasons.push("VIP Client priority");
    }

    // 2. Overdue status
    if (item.isOverdue) {
        const val = weights.overdueWeight * 1.5;
        score += val * multiplier;
        reasons.push("Already overdue");
    }

    // 3. Deadline proximity
    if (item.deadline) {
        const today = new Date(2025, 11, 20);
        const [day, month] = item.deadline.split('.').map(Number);
        const deadlineDate = new Date(2025, month - 1, day);

        const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= 2) {
            score += (weights.deadlineWeight * 1.5) * multiplier;
            reasons.push("Critical deadline (2 days)");
        } else if (diffDays <= 7) {
            score += (weights.deadlineWeight * 0.8) * multiplier;
            reasons.push("Upcoming deadline (1 week)");
        }
    }

    // 4. Complexity (Atyp items)
    const atypCount = item.items?.filter(i => i.isAtyp).length || 0;
    if (atypCount > 0) {
        score += (weights.complexityWeight * (atypCount > 2 ? 1.5 : 1)) * multiplier;
        reasons.push(`${atypCount} atyp items requiring extra care`);
    }

    return { score, reasons };
};

/**
 * Optimized planning for all or specific stages.
 * @param {Array} items - List of all production orders
 * @param {Object} settings - User settings including mode and weights
 * @param {String} specificStage - Optional, only plan for this stage
 */
export const applyAutoPlaning = (items, settings, specificStage = null) => {
    // Stage-specific or all stages
    const stagesToPlan = specificStage ? [specificStage] : [...new Set(items.map(i => i.stage))];
    const unchangedItems = items.filter(i => !stagesToPlan.includes(i.stage));

    let processedItems = [];

    stagesToPlan.forEach(stage => {
        const stageItems = items.filter(i => i.stage === stage);
        const sorted = stageItems.map(item => {
            const { score, reasons } = calculatePriorityScore(item, settings);
            return {
                ...item,
                aiScore: score,
                aiReason: reasons.join(", ")
            };
        }).sort((a, b) => b.aiScore - a.aiScore);

        processedItems = [...processedItems, ...sorted];
    });

    // Merge planned stages with unchanged stages
    // We need to maintain the item list structure
    return [...unchangedItems, ...processedItems];
};
