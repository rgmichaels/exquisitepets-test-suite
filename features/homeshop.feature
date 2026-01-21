Feature: HomeShop page

  As a visitor
  I want to open the HomeShop page
  So that I can confirm the site is up

  Scenario: HomeShop page returns OK
    Given I open the "HomeShop" page
    Then the navigation response should be OK
