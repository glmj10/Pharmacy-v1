package oop.inheritance;

public class Demo {
    Vehicle car = new Car();

}


class Vehicle {
    protected String color;
    protected String brand;

    public void show() {
        System.out.println("GO");
    }

    public String getColor() {
        return color;
    }

    public String getBrand() {
        return brand;
    }
}

class Car extends Vehicle {
    private String engine;
    public String color;

    public String getEngine() {
        return engine;
    }

    public String getVehicleColor() {
        return super.getColor();
    }

    @Override
    public String getColor() {
        return color;
    }
}