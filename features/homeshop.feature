Feature: HomeShop page

  As a visitor
  I want to open the HomeShop page
  So that I can confirm the site is up

  Scenario: HomeShop page returns OK
    Given I open the "HomeShop" page
    Then the navigation response should be OK
  
  Scenario: Home and shop page shows text
    Given I open the "HomeShop" page
    Then the header and paragraph text should be visible
      | headerText     | EXQUISITE PETS, LTD.                                                                                                                                         |
      | paragraphText  | We come from a family of farmers. My Grandmother was one of 18 children and always believed that All-Natural ingredients were the key to a long and happy life! Thank you so much for supporting our small business! |

  Scenario: Home and shop page shows products
    Given I open the "HomeShop" page
    Then the product data should be visible for each product
      | productName                                                                                                                                                                   | productPrice |
      | Exquisite Pets 6" Collagen Sticks for Dogs 10-Pack - All-Natural Brazilian Beef for Joint & Dental Health - Grain-Free, High Protein, Low Fat, Gentle on Stomach             | $11.95       |
      | Exquisite Pets 12" Collagen Sticks for Dogs 5-Pack - All-Natural Brazilian Beef for Joint & Dental Health - Grain-Free, High Protein, Low Fat, Gentle on Stomach            | $17.95       |
      | Exquisite Pets 10-Pack of Roasted Pig Ears for Dogs-Bulk All Natural, Brazilian Single-Ingredient Chews! Safe & Digestible-Full-Size Ears! Cleans Teeth & Gums. Aggressive Chewers. Treats for Dogs            | $16.75       |
      | 5-pack of Bully Sticks 12" Sticks            | $17.95       |
      | 12" Bully Sticks 3lb-Bag Bulk 100% Brazilian Bull Pizzle Thick Odorless Long Lasting No Grains or Rawhide Helps Relive Pet Boredom All-Natural Dog Treats Aggressive Chewers            | $99.95       |
      | Exquisite Pets (40)-Pack of Chicken Feet for Dogs All-Natural, No Nails Premium Quality Dehydrated Dog Treats            | $27.95       |
      | Exquisite Pets 35-Pack of Roasted Pig Ears for Dogs-Bulk All Natural, Brazilian Single-Ingredient Chews! Safe & Digestible-Full-Size Ears! Cleans Teeth & Gums. Aggressive Chewers. Treats for Dogs            | $39.95       |
      | Exquisite Pets Parrot Toy Chew Toy for Amazon Parrots Medium & Large Birds All-Natural Wood Shredding Foraging Chewing            | $14.95       |
      | Exquisite Pets Parrot Toy for Amazon Parrots Small & Medium Birds Pots Cups Shredding Foraging Chewing Playful Exercise            | $13.95       |
      | Exquisite Pets 100-Pack of Roasted Pig Ears for Dogs-Bulk All Natural, Brazilian Single-Ingredient Chews! Safe & Digestible-Full-Size Ears! Cleans Teeth & Gums. Aggressive Chewers. Treats for Dogs            | $109.95       |