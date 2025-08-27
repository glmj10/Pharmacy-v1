package oop.abstract_class_and_interface;

public class Interface{
    public static void main(String[] args) {
        Circle circle = new Circle();

        circle.draw();
        circle.move(5, 10);
        circle.draw();

        Drawable d = circle;
        d.draw();

        Movable m = circle;
        m.move(20, 30);
    }


}


interface Drawable {
    void draw();
}

interface Movable {
    void move(int x, int y);
}

class Circle implements Drawable, Movable {
    private int x, y;

    @Override
    public void draw() {
        System.out.println("Drawing a Circle at (" + x + "," + y + ")");
    }

    @Override
    public void move(int x, int y) {
        this.x = x;
        this.y = y;
        System.out.println("Moved Circle to (" + x + "," + y + ")");
    }
}