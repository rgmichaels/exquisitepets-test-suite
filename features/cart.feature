@cart

Feature: Shopping cart

  @smoke
  Scenario: Cart page shows empty state
    Given the shopping cart is empty
    When I open the cart page
    Then the cart should be empty
    And the cart should show the empty message

  Scenario: Add a product to the cart and remove it
    Given the shopping cart is empty
    And I open the "HomeShop" page
    When I open the product "Exquisite Pets 6\" Collagen Sticks for Dogs 10-Pack - All-Natural Brazilian Beef for Joint & Dental Health - Grain-Free, High Protein, Low Fat, Gentle on Stomach" from the home page
    Then I should be on the product page "https://www.exquisitepets.shop/shop/p/exquisite-pets-6-collagen-sticks-for-dogs-10-pack-all-natural-brazilian-beef-for-joint-dental-health-grain-free-high-protein-low-fat-gentle-on-stomach"
    When I add the product to the cart
    And I open the cart page
    Then the cart should contain the product "Exquisite Pets 6\" Collagen Sticks for Dogs 10-Pack - All-Natural Brazilian Beef for Joint & Dental Health - Grain-Free, High Protein, Low Fat, Gentle on Stomach"
    When I remove the product "Exquisite Pets 6\" Collagen Sticks for Dogs 10-Pack - All-Natural Brazilian Beef for Joint & Dental Health - Grain-Free, High Protein, Low Fat, Gentle on Stomach" from the cart
    Then the cart should not contain the product "Exquisite Pets 6\" Collagen Sticks for Dogs 10-Pack - All-Natural Brazilian Beef for Joint & Dental Health - Grain-Free, High Protein, Low Fat, Gentle on Stomach"
    And the cart should be empty
