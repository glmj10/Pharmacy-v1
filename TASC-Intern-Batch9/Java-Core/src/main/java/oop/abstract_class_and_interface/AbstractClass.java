package oop.abstract_class_and_interface;

public class AbstractClass {
    public static void main(String[] args) {
        Animal dog = new Dog();
        dog.makeSound();
        dog.eat();

        Animal cat = new Cat();
        cat.makeSound();
        cat.eat();
    }
}


abstract class Animal {
    abstract void makeSound();

    void eat() {
        System.out.println("This animal is eating.");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println("Woof woof!");
    }
}

class Cat extends Animal {
    @Override
    void makeSound() {
        System.out.println("Meow!");
    }
}
