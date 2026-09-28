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

    const factory = await ethers.deployContract("SurveyFactory", [
        ethers.parseEther("50"),
        ethers.parseEther("0.1"),
    ]);
    const tx = await factory.createSurvey({
        title,
        description,
        targetNumber: 100,
        questions
    }, {
        value: ethers.parseEther("100"),
    }
    );
    const receipt = await tx.wait();
    let surveyAddress;
    receipt.logs.forEach((log) => {
        const event = factory.interface.parseLog(log);
        if (event?.name == "SurveyCreated") {
            surveyAddress = event.args[0];
        }
    });

    //const surveys = await factory.getSurveys();

    //const survey = await ethers.deployContract("Survey", [title, description, questions]);
    const surveyC = await ethers.getContractFactory("Survey");
    const signers = await ethers.getSigners();
    const respondent = signers[1];
    if (surveyAddress) {
        const survey = await surveyC.attach(surveyAddress);
        await survey.connect(respondent);
        console.log(
            ethers.formatEther(await ethers.provider.getBalance(surveyAddress))
        );
        const submitTx = await survey.submitAnswer({
            respondent: respondent,
            answers: [1]
        });
        await submitTx.wait();
        console.log(
            ethers.formatEther(await ethers.provider.getBalance(surveyAddress)),
        );
    }
})
