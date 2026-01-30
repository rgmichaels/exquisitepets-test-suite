@smoke
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
    Then the product data from "homeshop-products.json" should be visible

  Scenario: Home and shop page product images load and have alt text
    Given I open the "HomeShop" page
    Then the product images from "homeshop-products.json" should load and have alt text

  Scenario: Home Page header shows social media links
    Given I open the "HomeShop" page
    Then the header should show social media links
      | platform  | url                                        |
      | Facebook  | https://www.facebook.com/share/16pgtnj9vf/ |
      | Instagram | https://www.instagram.com/exquisite_pets   |

  Scenario: Home page shows contact email in footer
    Given I open the "HomeShop" page
    Then the footer should contain the email "email: Exquisitepetsltd@yahoo.com"
