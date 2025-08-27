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
        m.method();
    }


}


interface Drawable {
    void draw();
    double method();
}

interface Movable {
    void move(int x, int y);
    int method();
}

class Circle implements Drawable, Movable {
    private int x, y;

    @Override
    public void draw() {
        System.out.println("Drawing a Circle at (" + x + "," + y + ")");
    }

    @Override
    public int method() {
        System.out.println("X");
        return 0;
    }

    @Override
    public void move(int x, int y) {
        this.x = x;
        this.y = y;
        System.out.println("Moved Circle to (" + x + "," + y + ")");
    }
}