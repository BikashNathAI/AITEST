Feature: User Login
  As a customer of ToolShop
  I want to log into my account
  So that I can access my orders and profile

  Background:
    Given I am on the login page

  Scenario: TC-BDD-001 | Valid login with correct credentials
    When I enter email "customer@practicesoftwaretesting.com"
    And I enter password "welcome01"
    And I click the Login button
    Then I should be redirected to the account page

  Scenario: TC-BDD-002 | Invalid login with wrong password
    When I enter email "customer@practicesoftwaretesting.com"
    And I enter password "wrongpassword123"
    And I click the Login button
    Then I should see an error message

  Scenario: TC-BDD-003 | Login form is visible on page load
    Then the email field should be visible
    And the password field should be visible
    And the Login button should be visible

  Scenario Outline: TC-BDD-004 | Multiple known users can login
    When I enter email "<email>"
    And I enter password "<password>"
    And I click the Login button
    Then I should be redirected to the account page

    Examples:
      | email                                 | password  |
      | customer@practicesoftwaretesting.com  | welcome01 |
      | admin@practicesoftwaretesting.com     | welcome01 |