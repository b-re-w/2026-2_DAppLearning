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
    let factory: any, owner, respondent1, respondent2;

    let minPoolAmount: bigint, minRewardAmount: bigint;

    beforeEach(async () => {
        const { ethers } = await network.connect();
        [owner, respondent1, respondent2] = await ethers.getSigners();

        minPoolAmount = ethers.parseEther("50");
        minRewardAmount = ethers.parseEther("0.1");

        factory = await ethers.deployContract("SurveyFactory", [
            minPoolAmount,
            minRewardAmount,
        ]);
    });

    const targetNumber = 100;
    const sampleSurvey = {
        title: "막무가내 설문조사",
        description: "중앙화된 설문조사로, 모든 데이터는 공개되지 않습니다.",
        targetNumber: targetNumber,
        questions: [
            {
                question: "누가 내 응답을 관리할 때 더 솔직할 수 있을까요?",
                options: ["구글 폼 운영자", "탈 중앙화된 블록체인", "상관 없음"],
            },
        ],
    };

    it("should deploy with correct minimum amounts", async () => {
        // check min_pool_amount and min_reward_amount

        // check min_pool_amount by giving less than min_pool_amount
        await expect(
            factory.createSurvey(sampleSurvey, {
                value: minPoolAmount - 1n,
            })
        ).to.be.revertedWith("Insufficient pool amount for survey creation");

        // check min_reward_amount by giving the smallest targetNumber that

        const tooLargeTargetNumber = minPoolAmount / minRewardAmount + 1n;
        await expect(
            factory.createSurvey(
                { ...sampleSurvey, targetNumber: tooLargeTargetNumber },
                { value: minPoolAmount }
            )
        ).to.be.revertedWith("Insufficient reward amount per respondent");

        // check valid case
        await expect(
            factory.createSurvey(sampleSurvey, { value: minPoolAmount })
        ).to.emit(factory, "SurveyCreated");
    });

    it("should create a new survey when valid values are provided", async () => {
        // prepare SurveySchema and call createSurvey with msg.value
        const tx = factory.createSurvey(sampleSurvey, { value: minPoolAmount * 2n });

        // check event SurveyCreated emitted
        await expect(tx).to.emit(factory, "SurveyCreated");

        // check surveys array length increased
        const surveys = await factory.getSurveys();
        expect(surveys.length).to.equal(1);
    });

    it("should revert if pool amount is too small", async () => {
        // expect revert when msg.value < min_pool_amount
        await expect(
            factory.createSurvey(sampleSurvey, { value: minPoolAmount / 5n })  // smaller than min_pool_amount
        ).to.be.revertedWith("Insufficient pool amount for survey creation");
    });

    it("should revert if reward amount per respondent is too small", async () => {
        // expect revert when msg.value / targetNumber < min_reward_amount
        const tooLargeTargetNumber = minPoolAmount / minRewardAmount + 1n;
        await expect(
            factory.createSurvey(
                { ...sampleSurvey, targetNumber: tooLargeTargetNumber },
                { value: minPoolAmount }
            )
        ).to.be.revertedWith("Insufficient reward amount per respondent");
    });

    it("should store created surveys and return them from getSurveys", async () => {
    // TODO: create multiple surveys and check getSurveys output
    });
});
