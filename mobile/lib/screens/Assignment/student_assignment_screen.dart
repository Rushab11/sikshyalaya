import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:sikshyalaya/global/authentication/auth_bloc.dart';
import 'package:sikshyalaya/screens/Assignment/student_assignment_bloc.dart';
import 'package:sikshyalaya/repository/student_assignment.dart';
import 'package:sikshyalaya/repository/models/student_assignment.dart';
import 'package:sikshyalaya/screens/Assignment/components/Assignments.dart';
import 'package:sikshyalaya/helpers/helper.dart';
import 'package:sikshyalaya/components/not_available.dart';
import 'package:sikshyalaya/screens/Student/student_wrapper.dart';

class AssignmentScreen extends StatelessWidget {
  const AssignmentScreen({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StudentWrapper(
      pageName: "Assignment",
      child: BlocProvider(
        create: (context) => StudentAssignmentBloc(
          studentAssignmentRepository: StudentAssignmentRepository(
              token: context.read<AuthBloc>().state.token),
        ),
        child: body(context),
      ),
    );
  }

  Widget body(BuildContext context) {
    Size size = MediaQuery.of(context).size;
    return BlocBuilder<StudentAssignmentBloc, StudentAssignmentState>(
      buildWhen: (previous, current) => previous != current,
      builder: (context, state) {
        if (state.isLoaded) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                margin: const EdgeInsets.fromLTRB(20, 0, 0, 20),
                child:
                    Text("Due", style: Theme.of(context).textTheme.headline5),
              ),
              Flexible(
                child: state.assignmentList[0] == Assignment.empty
                    ? NotAvailable(size: size, text: "No Assignments")
                    : ListView.builder(
                        itemCount: state.dueAssignmentList.length,
                        shrinkWrap: true,
                        itemBuilder: (context, index) {
                          return Assignments(
                            courseCode: state
                                .dueAssignmentList[index].course!.course_code!,
                            dueDate: dateHandler(state.dueAssignmentList[index]
                                .due_date!)["completeDate"],
                            title: state.dueAssignmentList[index].title!,
                            contents: state.dueAssignmentList[index].contents!,
                            instructor: studentInstructor(
                                state.dueAssignmentList[index].instructor!),
                            files: state.assignmentList[index].files ?? [],
                          );
                        },
                      ),
              ),
              Container(
                margin: const EdgeInsets.fromLTRB(20, 0, 0, 20),
                child: Text("Missing",
                    style: Theme.of(context).textTheme.headline5),
              ),
              Flexible(
                child: state.assignmentList[0] == Assignment.empty
                    ? NotAvailable(size: size, text: "No Assignments")
                    : ListView.builder(
                        itemCount: state.dueAssignmentList.length,
                        shrinkWrap: true,
                        itemBuilder: (context, index) {
                          return Assignments(
                            courseCode: state
                                .dueAssignmentList[index].course!.course_code!,
                            dueDate:
                                "${dateHandler(state.dueAssignmentList[index].due_date!)["passedDays"]} days ago",
                            title: state.dueAssignmentList[index].title!,
                            contents: state.dueAssignmentList[index].contents!,
                            instructor: studentInstructor(
                                state.dueAssignmentList[index].instructor!),
                            files: state.assignmentList[index].files ?? [],
                          );
                        },
                      ),
              ),
              Container(
                margin: const EdgeInsets.fromLTRB(20, 0, 0, 20),
                child:
                    Text("Due", style: Theme.of(context).textTheme.headline5),
              ),
              Flexible(
                child: state.assignmentList[0] == Assignment.empty
                    ? NotAvailable(size: size, text: "No Assignments")
                    : ListView.builder(
                        itemCount: state.dueAssignmentList.length,
                        shrinkWrap: true,
                        itemBuilder: (context, index) {
                          return Assignments(
                            courseCode: state
                                .dueAssignmentList[index].course!.course_code!,
                            dueDate: dateHandler(state.dueAssignmentList[index]
                                .due_date!)["completeDate"],
                            title: state.dueAssignmentList[index].title!,
                            contents: state.dueAssignmentList[index].contents!,
                            instructor: studentInstructor(
                                state.dueAssignmentList[index].instructor!),
                            files: state.assignmentList[index].files ?? [],
                          );
                        },
                      ),
              ),
            ],
          );
        } else {
          return Container(
              alignment: Alignment.center, child: CircularProgressIndicator());
        }
      },
    );
  }
}
