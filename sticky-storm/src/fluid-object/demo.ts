/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { v4 as uuidv4 } from 'uuid';

export class FakeUser {
    /**
     * Purely for demo purposes.
     */    
    public static getFakeUserId(): string {        
        return uuidv4();        
    }    

    /**
     * Purely for demo purposes.
     */
    public static getFakeName(): string {
        return this.fakeNames[Math.floor(Math.random() * this.fakeNames.length)];
    }

    /**
     * Purely for demo purposes.
     */
    private static fakeNames: string[] = [
        "Azariah",
        "Charlie",
        "Justice",
        "Remy",
        "Oakley",
        "Skyler",
        "Finley",
        "Dakota",
        "Tatum",
        "Jamie",
        "Armani",
        "Briar",
        "Landry",
        "River",
        "Emerson",
        "Sage",
        "Casey",
        "Phoenix",
        "Amari",
        "Shiloh",
        "Rory",
        "Hayden",
        "Milan",
        "Remington",
        "Royal",
        "Lennox",
        "Lennon",
        "Sutton",
        "Blake",
        "Rowan",
        "Ari",
        "Kamryn",
        "Parker",
        "Emory",
        "Alexis",
        "Karsyn",
        "Dallas",
        "Leighton",
        "Reign",
        "Sawyer",
        "Ellis",
        "Eden",
        "Rylan",
        "Peyton",
        "Avery",
        "Ariel",
        "Elliott",
        "Quinn",
        "Riley",
        "Lyric"
    ]
}

export class AutoNote {
    /**
     * Purely for demo purposes.
     */
    public static createDemoNote(): string {
        const text = this.demoText[Math.floor(Math.random() * this.demoText.length)]
        return text;
    }

    /**
     * Purely for demo purposes.
     */
    private static demoText: string[] = [
        "Formal Friday!!!",
        "Free hot stone massages :-)",
        "An enormous ball pit. Whatever you're imagining, think bigger.",
        "At least one meeting free day each week.",
        "An espresso cart at least once a month.",
        "Personal trainer and dietitian on call 24/7",
        "Motivational posters. With cats.",
        "A little more recognition, thanks.",
        "Full spectrum lighting and higher oxygen in the air.",
        "Yoga balls instead of chairs.",
        "More virtual brainstorming.",
        "Fewer snakes.",
        "Motivational posters. With dogs.",
        "Candy dispensers by the door.",
        "Get rid of all the candy.",
        "Baskets of ferrets in the break room. Or just ferrets.",
        "80s themed game nights.",
        "Fewer motivational posters.",
        "A gym where we can workout with the personal trainers",
        "Table tennis. Competitive table tennis."
    ]
}