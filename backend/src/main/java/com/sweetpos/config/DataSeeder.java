package com.sweetpos.config;

import com.sweetpos.entity.Category;
import com.sweetpos.entity.Customer;
import com.sweetpos.entity.Product;
import com.sweetpos.entity.User;
import com.sweetpos.repository.CategoryRepository;
import com.sweetpos.repository.CustomerRepository;
import com.sweetpos.repository.ProductRepository;
import com.sweetpos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCategories();
        seedProducts();
        seedCustomers();
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;
        log.info("Seeding default users...");

        userRepository.save(User.builder()
                .username("admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .fullName("System Admin")
                .email("admin@sweetpos.com")
                .role(User.UserRole.ADMIN)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .username("cashier")
                .passwordHash(passwordEncoder.encode("admin123"))
                .fullName("Default Cashier")
                .email("cashier@sweetpos.com")
                .role(User.UserRole.CASHIER)
                .active(true)
                .build());

        log.info("Users seeded: admin/admin123, cashier/admin123");
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        log.info("Seeding categories...");

        categoryRepository.save(Category.builder().name("Sweets").description("Traditional sweets and candies").color("#FF6B6B").icon("🍬").sortOrder(1).active(true).build());
        categoryRepository.save(Category.builder().name("Cakes").description("Cakes and pastries").color("#4ECDC4").icon("🎂").sortOrder(2).active(true).build());
        categoryRepository.save(Category.builder().name("Beverages").description("Drinks and juices").color("#45B7D1").icon("🥤").sortOrder(3).active(true).build());
        categoryRepository.save(Category.builder().name("Snacks").description("Savory snacks").color("#96CEB4").icon("🍿").sortOrder(4).active(true).build());
        categoryRepository.save(Category.builder().name("Ice Cream").description("Ice cream and frozen treats").color("#DDA0DD").icon("🍦").sortOrder(5).active(true).build());
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;
        log.info("Seeding products...");

        var categories = categoryRepository.findAll();
        var sweets = categories.stream().filter(c -> c.getName().equals("Sweets")).findFirst().orElse(null);
        var cakes = categories.stream().filter(c -> c.getName().equals("Cakes")).findFirst().orElse(null);
        var beverages = categories.stream().filter(c -> c.getName().equals("Beverages")).findFirst().orElse(null);
        var snacks = categories.stream().filter(c -> c.getName().equals("Snacks")).findFirst().orElse(null);
        var iceCream = categories.stream().filter(c -> c.getName().equals("Ice Cream")).findFirst().orElse(null);

        productRepository.save(Product.builder().name("Milk Toffee").barcode("8901234001").category(sweets).costPrice(new BigDecimal("150")).sellingPrice(new BigDecimal("250")).stockQuantity(100).unit("pack").build());
        productRepository.save(Product.builder().name("Coconut Candy").barcode("8901234002").category(sweets).costPrice(new BigDecimal("80")).sellingPrice(new BigDecimal("150")).stockQuantity(200).unit("pack").build());
        productRepository.save(Product.builder().name("Chocolate Fudge").barcode("8901234003").category(sweets).costPrice(new BigDecimal("200")).sellingPrice(new BigDecimal("350")).stockQuantity(75).unit("box").build());
        productRepository.save(Product.builder().name("Butter Cake").barcode("8901234004").category(cakes).costPrice(new BigDecimal("500")).sellingPrice(new BigDecimal("850")).stockQuantity(20).unit("piece").build());
        productRepository.save(Product.builder().name("Chocolate Cake").barcode("8901234005").category(cakes).costPrice(new BigDecimal("800")).sellingPrice(new BigDecimal("1500")).stockQuantity(10).unit("piece").build());
        productRepository.save(Product.builder().name("Cup Cake (6 pack)").barcode("8901234006").category(cakes).costPrice(new BigDecimal("300")).sellingPrice(new BigDecimal("550")).stockQuantity(30).unit("pack").build());
        productRepository.save(Product.builder().name("Fresh Juice").barcode("8901234007").category(beverages).costPrice(new BigDecimal("100")).sellingPrice(new BigDecimal("200")).stockQuantity(50).unit("glass").build());
        productRepository.save(Product.builder().name("Iced Coffee").barcode("8901234008").category(beverages).costPrice(new BigDecimal("120")).sellingPrice(new BigDecimal("250")).stockQuantity(40).unit("glass").build());
        productRepository.save(Product.builder().name("Samosa (3 pack)").barcode("8901234009").category(snacks).costPrice(new BigDecimal("60")).sellingPrice(new BigDecimal("120")).stockQuantity(80).unit("pack").build());
        productRepository.save(Product.builder().name("Rolls (5 pack)").barcode("8901234010").category(snacks).costPrice(new BigDecimal("100")).sellingPrice(new BigDecimal("200")).stockQuantity(60).unit("pack").build());
        productRepository.save(Product.builder().name("Vanilla Ice Cream").barcode("8901234011").category(iceCream).costPrice(new BigDecimal("150")).sellingPrice(new BigDecimal("300")).stockQuantity(25).unit("cup").build());
        productRepository.save(Product.builder().name("Chocolate Ice Cream").barcode("8901234012").category(iceCream).costPrice(new BigDecimal("170")).sellingPrice(new BigDecimal("350")).stockQuantity(25).unit("cup").build());
    }

    private void seedCustomers() {
        if (customerRepository.count() > 0) return;
        log.info("Seeding customers...");

        customerRepository.save(Customer.builder().name("Walk-in Customer").phone("0000000000").active(true).build());
        customerRepository.save(Customer.builder().name("Kamal Perera").phone("0771234567").email("kamal@email.com").loyaltyPoints(50).active(true).build());
        customerRepository.save(Customer.builder().name("Nimal Silva").phone("0779876543").email("nimal@email.com").loyaltyPoints(120).active(true).build());
    }
}
