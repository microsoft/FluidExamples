# About

Our Trip Planner is an example app where users can collaborate on trip planning. 
In our example we have hardcoded a single trip called "West Coast Trip", including 3 cities. 
For each itinerary stop, users can add notes and "to do" items (place to see, description etc). 
This example intends to educate on how FF collaboration can empower existing apps having their own data model and source of truth. 
This project is work in progress. In its final form it will address following topics:

1. Containers. Users should be clear how to reason about when and where to apply FF containers, how to share them etc.
2. Basic DDSes. Users should be clear how "optimistic" DDSes behave, and how to apply that knowledge in our sample app. We are starting with `SharedMap` and `SharedString`.
3. Modeling Collaboration. Users should be clear how to model more complex collaboration data. In our sample app here, we have collections where each item can have place, description & category. We want to discuss how we are splitting the model in a way where users do not inadvertently revert each other's changes, while still considering performance implications.
4. Audience. Users should be clear how to use `audience` to enhance collaboration experience.
5. Signals (TBD based on availability). Users should be clear on distinguishing persistent vs non-persistent data, and how each of them apply to various use cases.
6. FF Eventing. Users should be clear how to use events to bind FF data. We have existing examples that talk about eventing, but here we are looking into that same topic, but at a larger scale.
7. Source of Truth. In our sample app, the source of truth is separate from FF data. Users should be clear how two data sources can be synchronized.
8. Container States. Users should be clear how container state can be observed and managed.
9. Schema Upgrades. To keep pace with FF lib. changes, users should be clear how they can safely execute schema upgrades.
10. Recovery. Users should be clear how they can recover corrupted data.

## Available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
