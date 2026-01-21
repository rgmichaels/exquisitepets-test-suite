Feature: About page

  As a visitor
  I want to open the About page
  So that I can confirm the site is up

  Scenario: About page returns OK
    Given I open the "About" page
    Then the navigation response should be OK
