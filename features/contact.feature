@smoke
Feature: Contact page

  As a visitor
  I want to open the Contact page
  So that I can confirm the site is up

  Scenario: Contact page returns OK
    Given I open the "Contact" page
    Then the navigation response should be OK


  Scenario: Contact page shows required text and form fields
    Given I open the Contact page
    Then the Contact page should display header and helper text
    And the Contact page should show the contact form fields and SEND button