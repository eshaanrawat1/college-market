export const formatMoney = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
};

export const formatPercent = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatProbability = (price: number): string => {
    return `${price}%`;
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const getPnLColor = (value: number): string => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
};

export const getOutcomeBadgeColor = (outcome: 'YES' | 'NO'): string => {
    return outcome === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'open':
            return 'bg-blue-100 text-blue-800';
        case 'closed':
            return 'bg-gray-100 text-gray-800';
        case 'resolved':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};