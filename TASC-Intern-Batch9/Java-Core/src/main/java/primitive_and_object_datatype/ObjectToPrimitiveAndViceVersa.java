package primitive_and_object_datatype;

public class ObjectToPrimitiveAndViceVersa {
    public static void main(String[] args) {
        int a = 2;
        CustomInteger myNumber = new CustomInteger(a);
        System.out.println(myNumber);

        int b = CustomInteger.parseInt(new CustomInteger(3));
        System.out.println("Object to primitive value: " + b);
        Integer x = 1220;
        int y = 1220;
        System.out.println(x == y);
    }
}

class CustomInteger {
    private int number;

    public CustomInteger(int number) {
        this.number = number;
    }

    public static int parseInt(CustomInteger customNumber) {
        return customNumber.getNumber();
    }

    public int getNumber() {
        return this.number;
    }

    @Override
    public String toString() {
        return "MyNumber Object: " + number;
    }
}
