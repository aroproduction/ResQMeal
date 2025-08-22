/**
 * Environmental Impact Calculation Utilities
 * Based on scientific data and food industry standards
 */

// CO2 emission factors for different food categories (kg CO2 per kg food)
export const CO2_EMISSION_FACTORS = {
    // Meat products have highest carbon footprint
    meat: 14.8,
    poultry: 6.9,
    fish: 5.4,

    // Dairy products
    dairy: 3.2,
    cheese: 13.5,

    // Plant-based foods
    vegetables: 2.0,
    fruits: 1.1,
    grains: 1.4,
    bread: 1.6,

    // Prepared foods (average)
    prepared: 3.5,

    // Default for unknown foods
    default: 2.5
};

// Water usage factors (liters per kg food)
export const WATER_USAGE_FACTORS = {
    meat: 15415,
    poultry: 4325,
    fish: 3500,
    dairy: 1000,
    cheese: 3178,
    vegetables: 287,
    fruits: 962,
    grains: 1644,
    bread: 1608,
    prepared: 1500,
    default: 1000
};

/**
 * Determine food category from food name/description
 */
export const determineFoodCategory = (foodName) => {
    const name = foodName.toLowerCase();

    if (name.includes('meat') || name.includes('beef') || name.includes('pork') ||
        name.includes('lamb') || name.includes('mutton')) {
        return 'meat';
    }

    if (name.includes('chicken') || name.includes('turkey') || name.includes('duck') ||
        name.includes('poultry')) {
        return 'poultry';
    }

    if (name.includes('fish') || name.includes('salmon') || name.includes('tuna') ||
        name.includes('seafood')) {
        return 'fish';
    }

    if (name.includes('cheese') || name.includes('cheddar') || name.includes('mozzarella')) {
        return 'cheese';
    }

    if (name.includes('milk') || name.includes('yogurt') || name.includes('dairy') ||
        name.includes('cream') || name.includes('butter')) {
        return 'dairy';
    }

    if (name.includes('vegetable') || name.includes('carrot') || name.includes('broccoli') ||
        name.includes('lettuce') || name.includes('spinach') || name.includes('tomato') ||
        name.includes('salad')) {
        return 'vegetables';
    }

    if (name.includes('fruit') || name.includes('apple') || name.includes('banana') ||
        name.includes('orange') || name.includes('grape') || name.includes('berry')) {
        return 'fruits';
    }

    if (name.includes('bread') || name.includes('baguette') || name.includes('roll') ||
        name.includes('loaf') || name.includes('toast')) {
        return 'bread';
    }

    if (name.includes('rice') || name.includes('pasta') || name.includes('grain') ||
        name.includes('cereal') || name.includes('oats')) {
        return 'grains';
    }

    if (name.includes('meal') || name.includes('prepared') || name.includes('cooked') ||
        name.includes('curry') || name.includes('stew') || name.includes('soup') ||
        name.includes('sandwich') || name.includes('pizza')) {
        return 'prepared';
    }

    return 'default';
};

/**
 * Convert various units to kg for standardized calculation
 */
export const convertToKg = (quantity, unit) => {
    const conversionRates = {
        // Weight units
        'kg': 1,
        'kilogram': 1,
        'kilograms': 1,
        'g': 0.001,
        'gram': 0.001,
        'grams': 0.001,
        'lbs': 0.453592,
        'lb': 0.453592,
        'pound': 0.453592,
        'pounds': 0.453592,
        'oz': 0.0283495,
        'ounce': 0.0283495,
        'ounces': 0.0283495,

        // Volume units (approximate conversions)
        'l': 1, // 1 liter ≈ 1 kg for most food liquids
        'liter': 1,
        'liters': 1,
        'ml': 0.001,
        'milliliter': 0.001,
        'milliliters': 0.001,

        // Count-based units (average weights)
        'pieces': 0.1, // Assuming average piece is 100g
        'piece': 0.1,
        'units': 0.1,
        'unit': 0.1,
        'items': 0.1,
        'item': 0.1,
        'servings': 0.25, // Assuming average serving is 250g
        'serving': 0.25,
        'portions': 0.3, // Assuming average portion is 300g
        'portion': 0.3,
        'plates': 0.4, // Assuming average plate is 400g
        'plate': 0.4,
        'bowls': 0.3,
        'bowl': 0.3
    };

    // Handle null/undefined unit
    if (!unit || typeof unit !== 'string') {
        return quantity * 0.1; // Default to 100g
    }

    const rate = conversionRates[unit.toLowerCase()] || 0.1; // Default to 100g
    return quantity * rate;
};

/**
 * Calculate CO2 reduction based on food type and quantity
 */
export const calculateCO2Reduction = (foodItemsOrQuantity, totalQuantity, unit) => {
    try {
        let totalCO2Saved = 0;
        
        // Handle single parameter case (just quantity in kg)
        if (arguments.length === 1 && typeof foodItemsOrQuantity === 'number') {
            const quantityInKg = foodItemsOrQuantity;
            return Math.round(quantityInKg * CO2_EMISSION_FACTORS.default * 100) / 100;
        }

        // Handle three parameter case
        const foodItems = foodItemsOrQuantity;
        const quantityInKg = convertToKg(totalQuantity, unit);

        if (Array.isArray(foodItems) && foodItems.length > 0) {
            // Calculate based on specific food items
            foodItems.forEach(item => {
                const category = determineFoodCategory(item.name || '');
                const emissionFactor = CO2_EMISSION_FACTORS[category] || CO2_EMISSION_FACTORS.default;

                // If item has specific quantity, use it; otherwise distribute total quantity
                let itemQuantityKg = quantityInKg / foodItems.length;
                if (item.quantity && item.unit) {
                    itemQuantityKg = convertToKg(item.quantity, item.unit);
                }

                totalCO2Saved += itemQuantityKg * emissionFactor;
            });
        } else if (typeof foodItems === 'string') {
            // Single food item
            const category = determineFoodCategory(foodItems);
            const emissionFactor = CO2_EMISSION_FACTORS[category] || CO2_EMISSION_FACTORS.default;
            totalCO2Saved = quantityInKg * emissionFactor;
        } else {
            // Use default factor
            totalCO2Saved = quantityInKg * CO2_EMISSION_FACTORS.default;
        }

        return Math.round(totalCO2Saved * 100) / 100; // Round to 2 decimal places
    } catch (error) {
        console.error('Error calculating CO2 reduction:', error);
        // Fallback calculation - handle both single param and multi param cases
        if (arguments.length === 1 && typeof foodItemsOrQuantity === 'number') {
            const quantityInKg = foodItemsOrQuantity;
            return Math.round(quantityInKg * CO2_EMISSION_FACTORS.default * 100) / 100;
        } else {
            const quantityInKg = convertToKg(totalQuantity || 0, unit || 'kg');
            return Math.round(quantityInKg * CO2_EMISSION_FACTORS.default * 100) / 100;
        }
    }
};

/**
 * Calculate water footprint saved
 */
export const calculateWaterSaved = (foodItemsOrQuantity, totalQuantity, unit) => {
    try {
        let totalWaterSaved = 0;
        
        // Handle single parameter case (just quantity in kg)
        if (arguments.length === 1 && typeof foodItemsOrQuantity === 'number') {
            const quantityInKg = foodItemsOrQuantity;
            return Math.round(quantityInKg * WATER_USAGE_FACTORS.default * 100) / 100;
        }

        // Handle three parameter case
        const foodItems = foodItemsOrQuantity;
        const quantityInKg = convertToKg(totalQuantity, unit);

        if (Array.isArray(foodItems) && foodItems.length > 0) {
            // Calculate based on specific food items
            foodItems.forEach(item => {
                const category = determineFoodCategory(item.name || '');
                const waterFactor = WATER_USAGE_FACTORS[category] || WATER_USAGE_FACTORS.default;

                let itemQuantityKg = quantityInKg / foodItems.length;
                if (item.quantity && item.unit) {
                    itemQuantityKg = convertToKg(item.quantity, item.unit);
                }

                totalWaterSaved += itemQuantityKg * waterFactor;
            });
        } else if (typeof foodItems === 'string') {
            // Single food item
            const category = determineFoodCategory(foodItems);
            const waterFactor = WATER_USAGE_FACTORS[category] || WATER_USAGE_FACTORS.default;
            totalWaterSaved = quantityInKg * waterFactor;
        } else {
            // Use default factor
            totalWaterSaved = quantityInKg * WATER_USAGE_FACTORS.default;
        }

        return Math.round(totalWaterSaved);
    } catch (error) {
        console.error('Error calculating water saved:', error);
        // Fallback calculation
        const quantityInKg = convertToKg(totalQuantity, unit);
        return Math.round(quantityInKg * WATER_USAGE_FACTORS.default);
    }
};

/**
 * Calculate number of people that can be served
 * Assumes average serving size of 250g per person
 */
export const calculatePeopleServed = (totalQuantity, unit = 'kg') => {
    if (!totalQuantity) return 0;
    const quantityInKg = convertToKg(totalQuantity, unit);
    const servingSizeKg = 0.25; // 250g per serving
    return Math.floor(quantityInKg / servingSizeKg);
};

/**
 * Get a formatted environmental impact summary
 */
export const getEnvironmentalImpactSummary = (foodItems, totalQuantity, unit = 'kg') => {
    // Handle case where function is called with only one parameter (quantity)
    if (arguments.length === 1 && typeof foodItems === 'number') {
        totalQuantity = foodItems;
        foodItems = null;
        unit = 'kg';
    }
    
    const co2Reduced = calculateCO2Reduction(foodItems, totalQuantity, unit);
    const waterSaved = calculateWaterSaved(foodItems, totalQuantity, unit);
    const peopleServed = calculatePeopleServed(totalQuantity, unit);

    return {
        co2Reduced: `${co2Reduced}kg`,
        waterSaved: `${waterSaved}L`,
        peopleServed,
        quantityInKg: convertToKg(totalQuantity, unit)
    };
};
