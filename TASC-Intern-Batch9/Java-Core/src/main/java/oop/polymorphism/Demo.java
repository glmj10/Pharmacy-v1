package oop.polymorphism;

public class Demo {
    public static void main(String[] args) {
        Vehicle vehicle = new Vehicle();
        System.out.print("Vehicle run: ");
        vehicle.show();
        Vehicle car = new Car();
        System.out.print("Car run: ");
        car.show();
    }
}


class Vehicle {
    protected String color;
    protected String brand;

    public void show() {
        System.out.println("GO");
    }
}

class Car extends Vehicle{
    private String engine;

    @Override
    public void show() {
        System.out.println("Car is running");
    }
}