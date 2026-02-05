@smoke @healthcheck
Feature: Basic healthcheck

  As a visitor
  I want to open the HomeShop page
  So that I can confirm the site is reachable

  Scenario: HomeShop page returns OK (healthcheck)
    Given I open the "HomeShop" page
    Then the navigation response should be OK

  Scenario: About page returns OK (healthcheck)
    Given I open the "About" page
    Then the navigation response should be OK

  Scenario: Contact page returns OK (healthcheck)
    Given I open the "Contact" page
    Then the navigation response should be OK
