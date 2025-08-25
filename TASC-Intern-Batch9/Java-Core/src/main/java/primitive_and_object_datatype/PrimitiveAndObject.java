package primitive_and_object_datatype;

public class PrimitiveAndObject {
    public static void main(String[] args) {
        //Kiểu dữ liệu nguyên thủy là một trong các kiểu dữ liệu trong java lưu trữ các giá trị đơn giản,
        //Được lưu trong vùng nhớ stack
        //Gán giá trị: Gán trực tiếp giá trị từ bộ nhớ
        //Tính chất: Bất biến, không thể thay đổi về mặt giá trị
        int a = 1;
        boolean b = true;
        char c = 'a';

        System.out.println(a + " " + b + " " + c);

        //Kiểu dữ liệu đối tượng là kiểu dữ liệu phức hợp - được cấu tạo từ nhiều thành phần dữ liệu,
        //Chứa thuộc tính và các phương thức
        //Lưu trong bộ nhớ heap
        //Gán giá trị: Gán tham chiếu(Địa chỉ) của đối tượng
        //Tính chất: Hầu hết các đối tượng đều có tính chất không bất biến, ngoại trừ một số trường hợp đặc biệt(String)
        String s = "Hello";
        StringBuilder builder = new StringBuilder(s);
        System.out.println(builder);
        System.out.println(builder.capacity());

        System.out.println(s);
        System.out.println(s.toLowerCase());
    }
}
