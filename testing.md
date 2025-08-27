[Test Cases.xlsx](https://github.com/user-attachments/files/22003013/Test.Cases.xlsx)
# Test Cases for Blood Donation Project

## Homepage
| Test Case ID | Description                        | Expected Result                          | Priority |
|--------------|------------------------------------|------------------------------------------|----------|
| TC-HP-01     | Open homepage                      | Homepage loads successfully               | High     |
| TC-HP-02     | Check navigation links             | All links redirect to correct pages       | Medium   |

## Donor Registration
| Test Case ID | Description                        | Expected Result                          | Priority |
|--------------|------------------------------------|------------------------------------------|----------|
| TC-DR-01     | Submit valid donor registration    | Data saved, success message displayed     | High     |
| TC-DR-02     | Submit form with empty fields      | Error message shown for required fields   | High     |
| TC-DR-03     | Invalid email format               | Error message displayed                   | Medium   |

## Find Blood
| Test Case ID | Description                        | Expected Result                          | Priority |
|--------------|------------------------------------|------------------------------------------|----------|
| TC-FB-01     | Search for available donors        | Matching donor list displayed             | High     |
| TC-FB-02     | Search with no results             | "No donors found" message displayed       | Medium   |

## Live Alerts
| Test Case ID | Description                        | Expected Result                          | Priority |
|--------------|------------------------------------|------------------------------------------|----------|
| TC-LA-01     | Trigger new blood request          | Alert should be visible to users          | High     |


