# QA Prompt — JAT functional, integration, and regression testing

Act as a Senior QA Engineer. Use the PRD and business rules as the source of expected behavior.

Create test cases for positive, negative, edge, regression, integration and end-to-end scenarios covering:
- batch create/edit and date range validation;
- participant management and confirmation for destructive actions;
- Student access to active batch ranges;
- required form fields, JPG/JPEG/PNG restrictions, future dates and out-of-range dates;
- correct/mismatched/cropped/blurred/irrelevant/ambiguous evidence;
- validation statuses and Student feedback;
- Request queue and human review actions;
- role access, Applied Jobs filtering and progress recalculation.

Each case must contain ID, requirement, case type, precondition, steps, test data/evidence ID, expected, actual, status and evidence reference.

Do not invent real execution results. Mark unexecuted tests Not Run; contradictory results Needs Retest; expected/actual mismatch Failed; environment blockers Blocked. Keep status validation separate from recruitment progress.

If performance tests are requested, distinguish browser/page audit metrics from API latency/throughput/error rate. Do not make up numeric targets or results.
