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

  Scenario: Cart page returns OK (healthcheck)
    Given I open the "Cart" page
    Then the navigation response should be OK

  Scenario: HomeShop page has a non-empty title (healthcheck)
    Given I open the "HomeShop" page
    Then the page should have a non-empty title

  Scenario: About page has a non-empty title (healthcheck)
    Given I open the "About" page
    Then the page should have a non-empty title

  Scenario: Contact page has a non-empty title (healthcheck)
    Given I open the "Contact" page
    Then the page should have a non-empty title

  Scenario: Cart page has a non-empty title (healthcheck)
    Given I open the "Cart" page
    Then the page should have a non-empty title

  Scenario: HomeShop page canonical url matches current url (healthcheck)
    Given I open the "HomeShop" page
    Then the canonical url should match the current url

  Scenario: Contact page canonical url matches current url (healthcheck)
    Given I open the "Contact" page
    Then the canonical url should match the current url

  Scenario: About page canonical url matches current url (healthcheck)
    Given I open the "About" page
    Then the canonical url should match the current url

  Scenario: Cart page shows empty message when empty (healthcheck)
    Given the shopping cart is empty
    When I open the cart page
    Then the cart should show the empty message

  Scenario: HomeShop page has a meta description (healthcheck)
    Given I open the "HomeShop" page
    Then the page should have a meta description
