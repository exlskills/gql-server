### courseDeliverySchedule

`course_id` should be base64-encoded string: concatenated word `Course` followed by semicolon and the course ID, e,g `Course:ap_java_test` is represented in the example below 
```$xslt
query CourseDeliverySched {
  courseDeliverySchedule(course_id: "Q291cnNlOmFwX2phdmFfdGVzdA==", date_on_or_after: "2018-09-19T00:00:00.000Z") {
    delivery_structure
    delivery_methods
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
    }
    scheduled_runs {
      run_start_date
      run_sessions {
        session_seq
        session_duration {
          months
          weeks
          days
          hours
          minutes
        }
        session_start_date
        instructors {
          username
          full_name
        }
      }
    }
  }
}
```