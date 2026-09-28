// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Survey.sol";

struct SurveySchema {
    string title;
    string description;
    Question[] questions;
}

event SurveyCreated(address surveyAddress);

contract SurveyFactory {
    Survey[] surveys;

    constructor() {}

    function createSurvey(SurveySchema calldata _survey) external {
        Survey survey = new Survey(_survey.title, _survey.description, _survey.questions);
        surveys.push(survey);

        emit SurveyCreated(address(survey));
    }

    function getSurveys() external view returns (Survey[] memory) {
        return surveys;
    }
}
