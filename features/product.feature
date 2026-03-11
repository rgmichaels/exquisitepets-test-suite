@smoke @product
Feature: Product detail page

  As a visitor
  I want to view a product detail page
  So that I can see accurate product information before adding to my cart

  Scenario Outline: Product detail page shows core content
    Given I open the "HomeShop" page
    When I open the product "<productName>" from the home page
    Then the product page title should be visible
    And the product page should show the price "<price>"
    And the product page main image should load
    And the product page should show the Add to Cart button

    Examples:
      | productName                                | price   |
      | Exquisite Pets 10-Pack of Roasted Pig Ears | $16.75  |
      | Exquisite Pets (40)-Pack of Chicken Feet   | $27.95  |
