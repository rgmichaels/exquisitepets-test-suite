@smoke @seo @wip
Feature: SEO essentials

  Scenario Outline: Page has basic SEO tags
    Given I open the "<page>" page
    Then the page should have a non-empty title
    And the page should have a meta description
    And the canonical url should match the current url

    Examples:
      | page     |
      | HomeShop |
      | About    |
      | Contact  |
