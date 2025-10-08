package array;

public class Demo {
    public static void main(String[] args) {
        int[] a = new int[100];
        for(int i = 0; i < a.length; i++) {
            a[i] = i;
        }

        for(int i = 0; i < a.length; i++) {
            if(i % 10 == 0 && i != 0) {
                System.out.println();
            }

            System.out.print(a[i] + " ");
        }
    }
}
