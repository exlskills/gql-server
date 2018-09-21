### courseDeliverySchedule

`course_id` should be base64-encoded string: concatenated word `Course` followed by semicolon and the course ID, e,g `Course:ap_java_test` is represented in the example below 
```$xslt
query CourseDeliverySched {
  courseDeliverySchedule(course_id: "Q291cnNlOmFwX2phdmFfdGVzdA==", date_on_or_after: "2018-09-19T00:00:00.000Z") {
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
        }
      }
    }
  }
}
```