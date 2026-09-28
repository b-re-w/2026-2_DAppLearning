// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct Question {
    string question;
    string[] options;
}

contract Survey {
    string public title;
    string public description;
    Question[] public questions;

    // primitive types: uint, int, bool, address, bytes <fixed length>
    // memory (stack variable), storage (state/blockchain variable), calldata
    constructor(
        string memory _title,  // string is variable length which is critical to blockchain
        string memory _description,
        Question[] memory _questions
    ) {
        title = _title;
        description = _description;
        for (uint i = 0; i < _questions.length; i++) {
            questions.push(
                Question({
                    question: _questions[i].question,
                    options: _questions[i].options
                })
            );
        }

        // Question storage q = questions.push();  // 실무 패턴
        // q.question = _questions[i].question;
        // q.options = _questions[i].options;
    }

    function getQuestions() external view returns (Question[] memory) {
        return questions;
    }
}
