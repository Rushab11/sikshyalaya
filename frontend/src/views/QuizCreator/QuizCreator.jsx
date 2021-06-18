import React, { useState, useRef, useContext, useEffect, useMemo } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import Button from "../../components/Button";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import * as yup from "yup";
import Checkbox from "./../../components/Checkbox";
import Grid from "@material-ui/core/Grid";
import DateFnsUtils from "@date-io/date-fns";
import { formatISO } from "date-fns";
import "./statics/css/quizCreator.css";
import colorscheme from "../../utils/colors";
import { UserContext } from "../../utils/Contexts/UserContext";
import callAPI from "../../utils/API";
import useAPI from "../../utils/useAPI";
import configs from "../../utils/configs";
import { DatePicker, TimePicker } from "../../components/CustomDateTime";
import CustomTextField from "../../components/CustomTextField";
import Question from "./components/Question";
import { QuizContext, QuizOptionContext } from "./QuizContext";
import { ImCross } from "react-icons/im";
import GroupBox from "./components/GroupBox";

const validationSchema = yup.object({
  quiz_title: yup.string("Enter the title of the quiz").required(),
  quiz_description: yup.string("Enter description").required(),
});

const QuizCreator = () => {
  let l = 0;
  const [popup, setPopup] = useState(false);
  const { user } = useContext(UserContext);
  const endPage = useRef(null);
  const [selectFile, setSelectedFile] = useState({});
  const quiz_file = useMemo(
    () => ({ selectFile, setSelectedFile }),
    [selectFile, setSelectedFile]
  );
  let answerList = [];

  const groupList = [];
  const [optionFile, setOptionFile] = useState({});
  const quizOptionFile = useMemo(
    () => ({ optionFile, setOptionFile }),
    [optionFile, setOptionFile]
  );
  const groupFormatter = (response) => {
    if (!response.data.length) {
      return [];
    }
    let tempCourse = [];
    let responseData = [];
    responseData = response.data.map((data) => {
      let formattedData = {
        id: data.id,
        semester: data.sem,
        program_id: data.program.id,
        program_name: data.program.name,
        course_id: data.course[0].id,
        course_code: data.course[0].course_code,
        course_name: data.course[0].course_name,
      };

      return formattedData;
    });

    return responseData;
  };
  const [groups, groupsComplete] = useAPI(
    { endpoint: "/api/v1/group/" },
    groupFormatter
  );

  if (groups && groups.length && groupsComplete) {
    console.log(groups);
    groups.map((group, index) => {
      groupList.push({
        name: `${group.program_name}, Sem ${group.semester} [Course ${group.course_code}]`,
        group: group.id,
        course: group.course_id,
      });
    });
  }

  const quizPostFormatter = (quiz) => {
    let tempGroupList = [];
    quiz.whoseQuizInfo &&
      quiz.whoseQuizInfo.map((grp) => tempGroupList.push(grp.group));
    const postquizValues = {
      end_time: formatISO(quiz.end_time, { representation: "time" }),
      start_time: formatISO(quiz.start_time, { representation: "time" }),
      date: formatISO(quiz.quiz_date, { representation: "date" }),
      title: quiz.quiz_title,
      description: quiz.quiz_description,
      is_randomized: quiz.isRandomized,
      display_individual: quiz.displayIndividual,
      group: tempGroupList,
      instructor: [user.id],
      course_id: quiz.whoseQuizInfo[0].course,
    };

    return postquizValues;
  };

  const quizQuestionPostFormatter = (question, index, newQuizId) => {
    question.question_image = null;
    let newAnswers = [];
    if (question.answer && question.answer.length) {
      question.answer.map((boolVal, index) => {
        if (boolVal === true) {
          newAnswers.push(index);
        }
      });
    } else {
      newAnswers = [];
    }
    question.answer = newAnswers;

    let newOption = [];
    if (question.options && question.options.length) {
      question.options.map((option, optionIndex) => {
        let formattedOption = {
          image: "",
          text: "",
        };
        if (
          optionFile[index] &&
          optionFile[index][optionIndex] &&
          optionFile[index][optionIndex].length
        ) {
          formattedOption.image = optionFile[index][optionIndex][0].name;
        } else {
          formattedOption.text = option;
        }
        newOption.push(formattedOption);
      });
    }
    question.options = JSON.stringify(newOption);
    question.quiz_id = newQuizId;
    return question;
  };

  const onSubmitHandler = async (values) => {
    console.log(JSON.stringify(values));
    let quiz = values;
    let questions = quiz.questions;
    delete quiz.questions;

    quiz = quizPostFormatter(quiz);

    let newQuizId = null;

    let postResponse = await callAPI({
      endpoint: `/api/v1/quiz/`,
      method: "POST",
      data: quiz,
    });
    newQuizId = postResponse.data.id;

    if (postResponse.status === 200 && newQuizId) {
      if (questions) {
        questions.map(async (question, index) => {
          let postQuestion = quizQuestionPostFormatter(
            question,
            index,
            newQuizId
          );

          if (question) {
            postResponse = await callAPI({
              endpoint: `/api/v1/quiz/${newQuizId}/question`,
              method: "POST",
              data: postQuestion,
            });

            let newquestionId = postResponse.data.id;
            let questionOptionImageData = new FormData();
            let questionImageData = new FormData();

            if (postResponse.status === 200 && selectFile[index]) {
              for (let i = 0; i < selectFile[index].length; i++) {
                questionImageData.append("files", selectFile[index][i]);
              }

              let imageResponse = await callAPI({
                endpoint: `/api/v1/quiz/${newQuizId}/question/${newquestionId}/question_image/`,
                method: "POST",
                data: questionImageData,
                headers: { "Content-Type": "multipart/form-data" },
              });
            }
            let allOptions = JSON.parse(postQuestion.options);

            questionOptionImageData.set("options", postQuestion.options);

            if (postResponse.status === 200 && optionFile[index]) {
              for (let i = 0; i < allOptions.length; i++) {
                if (optionFile[index][i] && optionFile[index][i].length) {
                  questionOptionImageData.append(
                    "files",
                    optionFile[index][i][0]
                  );
                }
              }

              let optionResponse = await callAPI({
                endpoint: `/api/v1/quiz/${newQuizId}/question/${newquestionId}/option_image/`,
                method: "POST",
                data: questionOptionImageData,
                headers: { "Content-Type": "multipart/form-data" },
              });
            }
          }
        });
      }
    }
    answerList = [];
    setSelectedFile({});
    setOptionFile({});
  };

  return (
    <DashboardLayout>
      <QuizOptionContext.Provider value={quizOptionFile}>
        <QuizContext.Provider value={quiz_file}>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            className="quizCreator_root"
          >
            <Grid item className="quizCreator_header">
              <a className="quizCreator_titleText">Quiz Creation Menu</a>
            </Grid>
            <Grid item className="quizCreator_body">
              <Grid item className="quizCreator_outerContainer">
                <Formik
                  initialValues={{
                    quiz_title: "",
                    quiz_description: "",
                    quiz_date: new Date(),
                    start_time: new Date(),
                    end_time: new Date(),
                    isRandomized: false,
                    whoseQuizInfo: [],
                    displayIndividual: false,
                  }}
                  validationSchema={validationSchema}
                  onSubmit={onSubmitHandler}
                  validateOnChange={false}
                  validateOnBlur={false}
                >
                  {({ values, setFieldValue }) => (
                    <>
                      {console.log(l++)}
                      <Form className="quizCreator_formBox">
                        <Grid
                          container
                          direction="column"
                          alignItems="center"
                          justify="center"
                          className="quizCreator_innerContainer"
                          spacing={1}
                        >
                          <Grid
                            item
                            xs={10}
                            className="quizCreator_titleFieldContainer"
                          >
                            <CustomTextField
                              id="quiz_title"
                              name="quiz_title"
                              placeholder="Enter the title of the quiz"
                              className="quizCreator_titleField"
                              autoComplete="off"
                            />
                          </Grid>
                          <Grid
                            item
                            className="quizCreator_descriptionFieldContainer"
                          >
                            <CustomTextField
                              id="quiz_description"
                              name="quiz_description"
                              placeholder="Description of the quiz"
                              className="quizCreator_descriptionField"
                              autoComplete="off"
                            />
                          </Grid>
                          <Grid item className="quizCreator_groupBoxOuter">
                            <GroupBox
                              name="whoseQuizInfo"
                              groupList={groupList}
                              quizInfo={values.whoseQuizInfo}
                            />
                          </Grid>
                          <Grid item>
                            <Grid
                              container
                              direction="row"
                              alignItems="center"
                              justify="center"
                              className="quizCreator_dateTimePickerContainer"
                              spacing={2}
                            >
                              <Grid item className="quizCreator_quizStartTime">
                                <TimePicker
                                  id="start_time"
                                  label="Start Time"
                                />
                              </Grid>
                              <Grid item className="quizCreator_quizEndTime">
                                <TimePicker id="end_time" label="End Time" />
                              </Grid>
                              <Grid item className="quizCreator_quizDateField">
                                <DatePicker
                                  id="quiz_date"
                                  label="Choose quiz date"
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid
                            container
                            direction="column"
                            alignItems="center"
                            justify="flex-start"
                            className="quizCreator_randomContainer"
                            wrap="nowrap"
                          >
                            <Grid item className="quizCreator_check">
                              <Checkbox
                                id="is_randomized"
                                name="isRandomized"
                                label="Randomize Questions"
                                className="quizCreator_randomCheckBox"
                              />
                            </Grid>
                            <Grid item className="quizCreator_check">
                              <Checkbox
                                id="displayIndividual"
                                name="displayIndividual"
                                label="Display Individually"
                                className="quizCreator_randomCheckBox"
                              />
                            </Grid>
                          </Grid>

                          <Grid item className="submission">
                            <Grid
                              container
                              alignItems="center"
                              justify="center"
                            >
                              <Question
                                name="questions"
                                val={values.questions}
                                answerList={answerList}
                                reference={endPage}
                              />
                            </Grid>
                            <Grid
                              container
                              alignItems="center"
                              justify="center"
                              direction="row"
                            >
                              <Grid
                                item
                                className="quizCreator_submitButtonContainer"
                              >
                                <button
                                  type="submit"
                                  className="quizCreator_submitButton"
                                >
                                  Submit
                                </button>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Form>
                    </>
                  )}
                </Formik>
                <div ref={endPage}></div>
              </Grid>
            </Grid>
          </Grid>
        </QuizContext.Provider>
      </QuizOptionContext.Provider>
    </DashboardLayout>
  );
};

export default QuizCreator;
