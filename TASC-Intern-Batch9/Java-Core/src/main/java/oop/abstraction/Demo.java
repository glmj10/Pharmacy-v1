package oop.abstraction;

public class Demo {
    public static void main(String[] args) {
        Vehicle car = new Car();
        System.out.println(car);
        car.run();

        Vehicle plane = new Plane();
        System.out.println(plane);
        plane.run();
    }
}


abstract class Vehicle {
    protected String color;
    protected String brand;

    abstract void run();

    public String getBrand() {
        return brand;
    }

    public String getColor() {
        return color;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public void setColor(String color) {
        this.color = color;
    }
}

class Car extends Vehicle{
    private String engine;

    @Override
    public void run() {
        System.out.println("Car is running");
    }

    public Car() {
        super.setBrand("ABC");
        super.setColor("X123");
        this.engine = "Default";
    }

    @Override
    public String toString() {
        return "Car status: " + brand + " color: " + color + " engine:" + engine;
    }
}

class Plane extends Vehicle {
    private String wing;

    @Override
    void run() {
        System.out.println("Plane is flying");
    }

    public Plane() {
        super.setBrand("ABC");
        super.setColor("X123");
        this.wing = "Default";
    }

    @Override
    public String toString() {
        return "Plane status: " + brand + " color: " + color + " wing:" + wing;
    }
}
