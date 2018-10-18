## courseDeliverySchedule

`course_id` should be base64-encoded string: concatenated word `Course` followed by semicolon and the course ID, e,g `Course:ap_java` is represented in the example below 
```$xslt
query CourseDeliverySched {
  courseDeliverySchedule(course_id: "Q291cnNlOmFwX2phdmE=", date_on_or_after: "2018-09-19T00:00:00.000Z") {
    _id
    delivery_structure
    delivery_methods
    course_notes
    course_duration {
      months
      weeks
      days
      hours
      minutes
    }
    session_info {
      session_seq
      headline
      desc
      session_notes
    }
    scheduled_runs {
      _id
      offered_at_price {
        amount
      }
      seat_purchased
      run_start_date
      run_sessions {
        _id
        session_seq
        session_duration {
          months
          weeks
          days
          hours
          minutes
        }
        session_start_date
        session_run_notes
        instructors {
          username
          full_name
          avatar_url
          headline
          biography
        }
      }
    }
  }
}
```

## startExam

mutation startExam($courseUnit: StartExamInput!){
  startExam(input: $courseUnit) {
    exam_session_id
    exam_id
    exam_time_limit
    completionObj{
      code
      processed
      msg
    }
  }
}

### Variables
{
  "courseUnit": {
    "courseId": "YXBfamF2YQ==",
    "unitId": "MjJiMDg3Yzc0ZTk0NGUxMzk5ODlmNTFkNmY0MTMyNDc="
  }
}