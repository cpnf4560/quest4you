/**
 * Tests for Badges Module
 */

describe('Badges Module', () => {
    
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
    });
    
    describe('Badge definitions', () => {
        test('should have all required badge properties', () => {
            BADGES.forEach(badge => {
                expect(badge).toHaveProperty('id');
                expect(badge).toHaveProperty('name');
                expect(badge).toHaveProperty('description');
                expect(badge).toHaveProperty('icon');
                expect(badge).toHaveProperty('category');
                expect(badge).toHaveProperty('condition');
                expect(typeof badge.condition).toBe('function');
            });
        });
        
        test('should have unique badge ids', () => {
            const ids = BADGES.map(b => b.id);
            const uniqueIds = [...new Set(ids)];
            expect(ids.length).toBe(uniqueIds.length);
        });
        
        test('should have valid categories', () => {
            const validCategories = ['quizzes', 'scores', 'engagement', 'social', 'profile', 'special'];
            BADGES.forEach(badge => {
                expect(validCategories).toContain(badge.category);
            });
        });
        
        test('should have valid tiers when defined', () => {
            const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
            BADGES.forEach(badge => {
                if (badge.tier) {
                    expect(validTiers).toContain(badge.tier);
                }
            });
        });
    });
    
    describe('Badge checking', () => {
        test('should unlock first_quiz badge after completing first quiz', () => {
            const stats = { completedQuizzes: 1 };
            const badge = BADGES.find(b => b.id === 'first_quiz');
            
            expect(badge.condition(stats)).toBe(true);
        });
        
        test('should not unlock quiz_master until 10 quizzes completed', () => {
            const badge = BADGES.find(b => b.id === 'quiz_master');
            
            expect(badge.condition({ completedQuizzes: 5 })).toBe(false);
            expect(badge.condition({ completedQuizzes: 10 })).toBe(true);
        });
        
        test('should unlock perfectionist on 100% score', () => {
            const badge = BADGES.find(b => b.id === 'perfectionist');
            
            expect(badge.condition({ highestScore: 99 })).toBe(false);
            expect(badge.condition({ highestScore: 100 })).toBe(true);
        });
        
        test('should track daily streak', () => {
            const badge = BADGES.find(b => b.id === 'streak_3');
            
            expect(badge.condition({ dailyStreak: 2 })).toBe(false);
            expect(badge.condition({ dailyStreak: 3 })).toBe(true);
        });
    });
    
    describe('Badge unlocking', () => {
        test('should store unlocked badges in localStorage', () => {
            const unlockedBadges = ['first_quiz', 'perfectionist'];
            saveUnlockedBadges(unlockedBadges);
            
            const stored = JSON.parse(localStorage.getItem('unlockedBadges'));
            expect(stored).toEqual(unlockedBadges);
        });
        
        test('should retrieve unlocked badges from localStorage', () => {
            localStorage.setItem('unlockedBadges', JSON.stringify(['first_quiz']));
            
            const badges = getUnlockedBadges();
            expect(badges).toEqual(['first_quiz']);
        });
        
        test('should return empty array if no badges unlocked', () => {
            const badges = getUnlockedBadges();
            expect(badges).toEqual([]);
        });
    });
    
    describe('Points calculation', () => {
        test('should calculate correct points for badges', () => {
            const badgePoints = {
                'bronze': 10,
                'silver': 25,
                'gold': 50,
                'platinum': 100,
                'default': 15
            };
            
            expect(getPointsForTier('bronze')).toBe(10);
            expect(getPointsForTier('silver')).toBe(25);
            expect(getPointsForTier('gold')).toBe(50);
            expect(getPointsForTier('platinum')).toBe(100);
            expect(getPointsForTier(undefined)).toBe(15);
        });
        
        test('should calculate total points from unlocked badges', () => {
            const unlockedBadges = [
                { tier: 'bronze' },
                { tier: 'silver' },
                { tier: 'gold' }
            ];
            
            const total = calculateTotalPoints(unlockedBadges);
            expect(total).toBe(10 + 25 + 50);
        });
    });
    
    describe('Stats tracking', () => {
        test('should initialize empty stats', () => {
            const stats = initializeStats();
            
            expect(stats.completedQuizzes).toBe(0);
            expect(stats.highestScore).toBe(0);
            expect(stats.dailyStreak).toBe(0);
            expect(stats.totalMatches).toBe(0);
        });
        
        test('should update stats correctly', () => {
            const stats = initializeStats();
            
            updateStats(stats, 'completedQuizzes', 1);
            expect(stats.completedQuizzes).toBe(1);
            
            updateStats(stats, 'highestScore', 95);
            expect(stats.highestScore).toBe(95);
        });
        
        test('should persist stats to localStorage', () => {
            const stats = { completedQuizzes: 5, highestScore: 85 };
            saveStats(stats);
            
            const stored = JSON.parse(localStorage.getItem('badgeStats'));
            expect(stored.completedQuizzes).toBe(5);
            expect(stored.highestScore).toBe(85);
        });
    });
});

// Mock badge definitions for testing
const BADGES = [
    {
        id: 'first_quiz',
        name: 'Primeiro Passo',
        description: 'Completa o teu primeiro quiz',
        icon: '🎯',
        category: 'quizzes',
        tier: 'bronze',
        condition: (stats) => stats.completedQuizzes >= 1
    },
    {
        id: 'quiz_master',
        name: 'Mestre dos Quizzes',
        description: 'Completa 10 quizzes',
        icon: '🏆',
        category: 'quizzes',
        tier: 'gold',
        condition: (stats) => stats.completedQuizzes >= 10
    },
    {
        id: 'perfectionist',
        name: 'Perfeccionista',
        description: 'Obtém 100% num quiz',
        icon: '💯',
        category: 'scores',
        tier: 'gold',
        condition: (stats) => stats.highestScore >= 100
    },
    {
        id: 'streak_3',
        name: 'Consistente',
        description: 'Mantém uma sequência de 3 dias',
        icon: '🔥',
        category: 'engagement',
        tier: 'silver',
        condition: (stats) => stats.dailyStreak >= 3
    }
];

// Mock implementations for testing
function saveUnlockedBadges(badges) {
    localStorage.setItem('unlockedBadges', JSON.stringify(badges));
}

function getUnlockedBadges() {
    const stored = localStorage.getItem('unlockedBadges');
    return stored ? JSON.parse(stored) : [];
}

function getPointsForTier(tier) {
    const points = {
        'bronze': 10,
        'silver': 25,
        'gold': 50,
        'platinum': 100
    };
    return points[tier] || 15;
}

function calculateTotalPoints(badges) {
    return badges.reduce((total, badge) => total + getPointsForTier(badge.tier), 0);
}

function initializeStats() {
    return {
        completedQuizzes: 0,
        highestScore: 0,
        dailyStreak: 0,
        totalMatches: 0,
        messagesSent: 0,
        profileCompleteness: 0
    };
}

function updateStats(stats, key, value) {
    stats[key] = value;
}

function saveStats(stats) {
    localStorage.setItem('badgeStats', JSON.stringify(stats));
}
