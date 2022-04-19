String studentInstructor(instructors) {
  final List instructorNames = [];
  if (instructors.length > 0) {
    instructors.forEach((element) => instructorNames.add(element.full_name));
    return instructorNames.join(' and ');
  }
  return '';
}

Map dateHandler(String dateTime) {
  String hour = "";
  String minute = "";
  String ampm = "";
  int day;
  String weekDay = "";
  DateTime? dateTimeParsed;
  String completeDate = "";
  int monthInt;
  String month = "";
  String monthDay = "";

  dateTimeParsed = DateTime.tryParse(dateTime);

  if (dateTimeParsed != null) {
    if (dateTimeParsed.hour > 12) {
      hour = (dateTimeParsed.hour - 12).toString().padLeft(2, '0');
      ampm = "PM";
    } else {
      hour = dateTimeParsed.hour.toString().padLeft(2, '0');
      ampm = "AM";
    }

    minute = dateTimeParsed.minute.toString().padLeft(2, '0');
    day = dateTimeParsed.weekday;
    monthInt = dateTimeParsed.month;
    monthDay = dateTimeParsed.day.toString().padLeft(2, '0');

    switch (day) {
      case 1:
        weekDay = "Monday";
        break;

      case 2:
        weekDay = "Tuesday";
        break;

      case 3:
        weekDay = "Wednesday";
        break;

      case 4:
        weekDay = "Thursday";
        break;

      case 5:
        weekDay = "Friday";
        break;

      case 6:
        weekDay = "Saturday";
        break;

      case 7:
        weekDay = "Sunday";
        break;

      default:
        weekDay = "";
        break;
    }
    switch (monthInt) {
      case 1:
        month = "Jan";
        break;

      case 2:
        month = "Feb";
        break;

      case 3:
        month = "Mar";
        break;

      case 4:
        month = "Apr";
        break;

      case 5:
        month = "May";
        break;

      case 6:
        month = "Jun";
        break;

      case 7:
        month = "Jul";
        break;

      case 8:
        month = "Aug";
        break;

      case 9:
        month = "Sep";
        break;

      case 10:
        month = "Oct";
        break;

      case 11:
        month = "Nov";
        break;

      case 12:
        month = "Dec";
        break;

      default:
        month = "";
        break;
    }

    completeDate = '$weekDay, $hour:$minute $ampm';
  }

  return {
    "hour": hour,
    "minute": minute,
    "ampm": ampm,
    "day": weekDay,
    "completeDate": completeDate,
    "month": month,
    "monthDay": monthDay,
  };
}