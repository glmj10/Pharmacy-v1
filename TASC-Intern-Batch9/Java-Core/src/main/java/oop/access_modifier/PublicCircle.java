package oop.access_modifier;

//Access modifier: public
public class PublicCircle {
    public double radius;
    public static final double PI = 3.14;

    public double calculateArea() {
        return Math.pow(radius, 2) * PI;
    }

    public double calculatePerimeter() {
        return 2 * PI * radius;
    }
}
