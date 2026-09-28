import { expect } from "chai";
import { network } from "hardhat";

it("Survey init", async () => {
    const { ethers } = await network.connect();

    const title: string = "막무가내 설문조사";
    const description: string = "중앙화된 설문조사로, 모든 데이터는 공개되지 않습니다.";
    const questions: Question[] = [
        {
            question: "누가 내 응답을 관리할 때 더 솔직할 수 있을까요?",
            options: [
                "구글 폼 운영자", "탈 중앙화된 블록체인", "상관 없음"
            ]
        }
    ]
    const s = await ethers.deployContract("Survey", [
        title,
        description,
        questions
    ]);
    const _title = await s.title();
    const _description = await s.description();
    const _questions = await s.getQuestions();
    expect(_title).eq(title);
    expect(_description).eq(description);
    expect(_questions[0].options).deep.eq(questions[0].options);

    const signers = await ethers.getSigners();
    const respondent = signers[1];
    await s.connect(respondent);
    await s.submitAnswer({
        respondent: respondent.address,
        answers: [1]
    });

    console.log(await s.getAnswers());
})
