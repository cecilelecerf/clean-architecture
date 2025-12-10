export const rawOrders = [
    { 
        type: "buy",  
        quantity: 100, 
        price: 50,  
        fee: 1,  
        currency: "EUR", 
        date: new Date("2024-01-01T10:00:00Z"), 
        status: "pending" 
    },
    { 
        type: "sell", 
        quantity: 50,  
        price: 75,  
        fee: 1,
        currency: "EUR", 
        date: new Date("2024-01-02T11:30:00Z"), 
        status: "executed" 
    },
    { 
        type: "buy",  
        quantity: 200, 
        price: 20,  
        fee: 1,  
        currency: "EUR", 
        date: new Date("2024-01-03T09:15:00Z"), 
        status: "pending" 
    },
    { 
        type: "sell", 
        quantity: 120, 
        price: 60,  
        fee: 1,
        currency: "EUR", 
        date: new Date("2024-01-04T14:00:00Z"), 
        status: "cancelled" 
    },
    { 
        type: "buy",  
        quantity: 80,  
        price: 100, 
        fee: 1,  
        currency: "EUR", 
        date: new Date("2024-01-05T08:45:00Z"), 
        status: "executed" 
    },
    { 
        type: "sell", 
        quantity: 30,  
        price: 150, 
        fee: 1,  
        currency: "EUR", 
        date: new Date("2024-01-06T16:20:00Z"), 
        status: "pending" 
    },
    { 
        type: "buy",  
        quantity: 60,  
        price: 90,  
        fee: 1,  
        currency: "EUR", 
        date: new Date("2024-01-07T13:10:00Z"), 
        status: "pending" 
    },
    { 
        type: "sell", 
        quantity: 40,  
        price: 110, 
        fee: 1,
        currency: "EUR", 
        date: new Date("2024-01-08T12:00:00Z"), 
        status: "executed" 
    },
    { 
        type: "buy",  
        quantity: 150, 
        price: 35,  
        fee: 1,  
        currency: "EUR", 
        date: new Date("2024-01-09T09:50:00Z"), 
        status: "pending" 
    },
    { 
        type: "sell", 
        quantity: 70,  
        price: 80,  
        fee: 1,
        currency: "EUR", 
        date: new Date("2024-01-10T15:30:00Z"), 
        status: "cancelled" 
    }
];
