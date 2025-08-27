package oop.inheritance;

public class Demo {
}


class Vehicle {
    protected String color;
    protected String brand;

    public void show() {
        System.out.println("GO");
    }
}

class Car extends Vehicle {
    private String engine;
    
}