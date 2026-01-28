@smoke @about
Feature: About page

  As a visitor
  I want to open the About page
  So that I can confirm the site is up

  Scenario: About page returns OK
    Given I open the "About" page
    Then the navigation response should be OK

  Scenario: About page shows core About Us text
    Given I open the "About" page
    Then the About page should display the About Us content

  @wip
  Scenario: About page shows required form fields
    Given I open the "About" page
    Then the About page should show the required form fields

