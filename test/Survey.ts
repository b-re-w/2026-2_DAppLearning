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


describe("SurveyFactory Contract", () => {
    let factory, owner, respondent1, respondent2;

    beforeEach(async () => {
        const { ethers } = await network.connect();
        [owner, respondent1, respondent2] = await ethers.getSigners();
        factory = await ethers.deployContract("SurveyFactory", [
            ethers.parseEther("50"), // min_pool_amount
            ethers.parseEther("0.1"), // min_reward_amount
        ]);
    });

    it("should deploy with correct minimum amounts", async () => {
        // TODO: check min_pool_amount and min_reward_amount
    });

    it("should create a new survey when valid values are provided", async () => {
        // TODO: prepare SurveySchema and call createSurvey with msg.value
        // TODO: check event SurveyCreated emitted
        // TODO: check surveys array length increased
    });

    it("should revert if pool amount is too small", async () => {
    // TODO: expect revert when msg.value < min_pool_amount
    });

    it("should revert if reward amount per respondent is too small", async () => {
    // TODO: expect revert when msg.value / targetNumber < min_reward_amount
    });

    it("should store created surveys and return them from getSurveys", async () => {
    // TODO: create multiple surveys and check getSurveys output
    });
});
