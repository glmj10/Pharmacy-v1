package string;

public class StringDemo {

    public static void main(String[] args) {
        String s1 = "Hello";
        String s2 = new String("Hello");
        String s3 = "Hello";
        String s4 = "Hi";

        //String pool
        System.out.println("Using == operation: " + (s1 == s3));
        System.out.println("Using == operation: " + (s1 == s4));

        //Heap memory
        System.out.println("Using equals method: " + (s3.equals(s4)));
        System.out.println("Using equals method: " + (s2.equals(s1)));

    }
}
