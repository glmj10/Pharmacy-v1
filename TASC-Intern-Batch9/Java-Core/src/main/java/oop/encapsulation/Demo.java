package oop.encapsulation;

public class Demo {
    public static void main(String[] args) {
        User user = new User();
        user.setPassword("12345");
        user.setUsername("Nguyen Van A");
        System.out.println(user.getPassword() + " " + user.getUsername());
    }
}
