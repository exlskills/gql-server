
Access:  http://localhost:8080/graph 

Must have the cookies present in the browser - access the local Learn site at http://localhost:3000/learn  first 
 

## List Courses
```
query listCourses {
  listCourses(first: 9999, resolverArgs: [{param: "list", value: "relevant"}]) {
    edges {
      node {
        id
        title
        headline
        enrolled_count
        view_count
        logo_url
        skill_level
        est_minutes
        primary_topic
        verified_cert_cost
        delivery_methods
        weight
      }
    }
  }
}
```

## List Units
### Top level only
```
query listUnits {
  listUnits(resolverArgs: [{param: "course_id", value: "Q291cnNlOmFwX2phdmE="}]) {
    edges {
      node {
        title
        has_exam
      }
    }
  }
}
```

### With Cards
```
query listUnits {
  listUnits(resolverArgs: [{param: "course_id", value: "Q291cnNlOmFwX2phdmE="}]) {
    edges {
      node {
        title
        has_exam
        sections_list {
          title
          cards_list {
            title
          }
        }
      }
    }
  }
}
```

## Card
```
query getCard {
  getCard(course_id: "Q291cnNlOmFwX2phdmE=", unit_id: "VW5pdDo5Yjg1OGFlYjczMTA0ZDEyOTJiZmFhYTRiZWE2Y2JjNA==", section_id: "U2VjdGlvbjpmZjgzMTcwYWE5ZjQ0NWNmODg3ZWExNzAwNGRjNWQxZA==", card_id: "Q2FyZDpkNGY5YTFhMGE2YTE0NDE4YTI3NzYwMTA5NmFjN2MzMQ==") {
    title
    github_edit_url
  }
}
```

## Course
```
query getCourse {
  getCourseById(course_id: "Q291cnNlOmFwX2phdmE=") {
    title
    units {
      edges {
        node {
          sections_list {
            cards_list {
              title
              github_edit_url
            }
          }
        }
      }
    }
  }
}
```

## List Text Match
```
query listTextMatchingCourseItems {
  listTextMatchingCourseItems(first: 50, searchText: "Classes", course_id: "Q291cnNlOnN5bnRheF9qYXZh") {
    edges {
      node {
        id
        itemType
        score
        title
        headline
        course_id
        unit_id
        section_id
        card_id
        highlights {
          inTitle
          inHeadline
          inText
          inCode
        }
      }
    }
  }
}
```

## Question Hint
```
query getQuestionHint {
   getQuestionHint(resolverArgs: [{param: "question_id", value: ""UXVlc3Rpb246OGIzMTZkNjQ3M2I1NDBhOGI2NTg4YzgxNGY2ZDdiNGI=""}]){
     hint
   }
}   
```


## Course Delivery Schedule

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

## List Instructors
```
query listInstructors {
  listInstructors(instructorTopics: ["Java"], resolverArgs: [{param: "text", value: "Java"}, {param: "full_name", value: "Java"}, {param: "primary_locale", value: "en"}]) {
    edges {
      node {
        full_name
        instructor_topics_en
        biography
        username
        headline
        avatar_url
        instructor_topics_locale
      }
    }
  }
}
```

## List Activities
```
query listActivities {
  listActivities(activityTypes:["attempted_exam"], dateRange:{date_from:"2018-09-10T00:00:00.000Z",date_to:"2019-01-10T00:00:00.000Z"}){
    edges{
      node {
        id
        date
        user_id
        type
        type_desc
        content
        activity_link
      }
    }
  }
}
```
### Date format
See [graphql-iso-date](https://www.npmjs.com/package/graphql-iso-date) for the `GraphQLDateTime` type:
```
resolver can take Date, date-time string or Unix timestamp (number)
new Date(Date.UTC(2017, 0, 10, 21, 33, 15, 233))

```

## User Activity Count by Date
```
query listActivities {
  getUserActivityCountByDate(activityTypes:["attempted_exam"],dateRange:{date_from:"2018-09-10T00:00:00.000Z",date_to:"2019-01-10T00:00:00.000Z"}){
    count
    date
  }
}
```

## startExam
```
mutation startExam($courseUnit: StartExamInput!){
  startExam(input: $courseUnit) {
    exam_session_id
    exam_id
    exam_time_limit
    completionObj{
      code
      msg
      msg_id
    }
  }
}
```
### Variables
```
{
  "courseUnit": {
    "courseId": "YXBfamF2YQ==",
    "unitId": "MjJiMDg3Yzc0ZTk0NGUxMzk5ODlmNTFkNmY0MTMyNDc="
  }
}
```

## Set Exam Question Answer
```
mutation setExamQA($submitEQA: SetExamQuestionAnswerInput!){
  setExamQuestionAnswer(input: $submitEQA) {
    completionObj{
      code
      msg
      msg_id
    }
  }
}
```
### Variables
```
{
  "submitEQA": {
    "exam_session_id": "RXhhbVNlc3Npb246NWJjZGMwODY2NDcwZGUwYjkxNDY5MDg0",
    "question_id": "UXVlc3Rpb246OGIzMTZkNjQ3M2I1NDBhOGI2NTg4YzgxNGY2ZDdiNGI=",
    "response_data": "{'selected_ids':['UXVlc3Rpb25NdWx0aXBsZURhdGE6NWJjZDM2MjVkNzlmOGYxYTUyMmVjMDVh']}"
  }
}
```
Prefixes: 
`ExamSession` 
`Question` 
`QuestionMultipleData` 


## Get Current Exam Question Answer
```
mutation getExamQA($getEQA: GetCurrentExamQuestionAnswerInput!){
  getCurrentExamQuestionAnswer(input: $getEQA) {
    submitted_at
    response_data
    completionObj{
      code
      msg
      msg_id
    }
  }
}
```
### Variables
```
{
  "getEQA": {
    "exam_session_id": "RXhhbVNlc3Npb246NWJjZGMwODY2NDcwZGUwYjkxNDY5MDg0",
    "question_id": "UXVlc3Rpb246OGIzMTZkNjQ3M2I1NDBhOGI2NTg4YzgxNGY2ZDdiNGI="
  }
}
```

## Submit Exam
```
mutation submitExam($submitExam: SubmitExamInput!){
  submitExam(input: $submitExam) {
    final_grade_pct
    pass_mark_pct
    completionObj{
      code
      msg
      msg_id
    }
  }
}
```
### Variables
```
{
  "submitExam": {
    "exam_session_id": "RXhhbVNlc3Npb246NWJjZGMwODY2NDcwZGUwYjkxNDY5MDg0"
  }
}
```

## Set Card Interaction
```
mutation setCardInteraction($cardInteraction: SetCardInteractionInput!){
  setCardInteraction(input: $cardInteraction) {
    completionObj{
      code
      msg
      msg_id
    }
  }
}
```
### Variables
```
{
  "cardInteraction": {
    "course_id": "Q291cnNlOmludHJvX3RvX3B5dGhvbg==",
    "unit_id": "VW5pdDpCWEVtZ3ZwaExCQVc=",
    "section_id": "U2VjdGlvbjpsaWNyWnNFY2hqcUY=",
    "card_id": "Q2FyZDpmRllTTXVSWXdlRG4=",
    "interaction": "view"
  }
}
```
