Feature: Contact page

  As a visitor
  I want to open the Contact page
  So that I can confirm the site is up

  Scenario: Contact page returns OK
    Given I open the "Contact" page
    Then the navigation response should be OK
