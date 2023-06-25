import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export let options = {
  stages: [
    { duration: '1m', target: 5 }, // simulate ramp-up of traffic from 0 to 5 users over 1 minute
    { duration: '1m30s', target: 10}, // stay at 10 users for 1minutes 30 seconds
    { duration: '1m', target: 0 }, // ramp-down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'] // request failure rate must be below 1%
  },
};

export default function () {
  const get_request = {
    method: 'GET',
    url: 'https://reqres.in/api/users?page=2',
  };
  const post_request = {
    method: 'POST',
    url: 'https://reqres.in/api/users',
    body: {
      name: 'Wavda',
      job: 'QA',
    },
    params: {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  };
  const put_request = {
    method: 'PUT',
    url: 'https://reqres.in/api/users/2',
    body: {
      name: 'Aniva',
      job: 'Engineer',
    },
    params: {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  };
  const delete_request= {
    method: 'DELETE',
    url: 'https://reqres.in/api/users/2'
  };

  const responses = http.batch([get_request, post_request, put_request, delete_request]);
  check(responses[0], {
    'GET status is 200': (r) => r.status === 200,
  });

  check(responses[1], {
    'POST status is 201': (r) => r.status === 201,
  });

  check(responses[2], {
    'PUT status is 200': (r) => r.status === 200,
  });

  check(responses[3], {
    'DELETE status is 204': (r) => r.status === 204,
  });
}

export function handleSummary(data) {
  return {
    "summary.json": JSON.stringify(data),
    "result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true })
  };
}
