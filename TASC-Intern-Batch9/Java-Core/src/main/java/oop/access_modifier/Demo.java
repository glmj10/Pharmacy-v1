package oop.access_modifier;

public class Demo {
    public static void main(String[] args) {

        //Test private modifier
        PrivateModifier privateModifier = new PrivateModifier();
        //privateModifier.balance = 2; //compile time error

        //Test protected modifier
        ProtectedModifier protectedModifier = new ProtectedModifier();
        protectedModifier.x = 1; //Can access because this class is in the same package with ProtectedModifier class
        protectedModifier.y = 2;
        protectedModifier.show();


        //Test public modifier
        PublicCircle circle = new PublicCircle();
        circle.radius = 2.3;
        System.out.println(circle.calculateArea());

        //Test default modifier
        DefaultModifier defaultModifier = new DefaultModifier();
        defaultModifier.x = 2;
        defaultModifier.y = 3;
        System.out.println(defaultModifier.sum());

    }
}
