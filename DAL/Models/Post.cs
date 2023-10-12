namespace DAL.Models
{
    public class Post
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public byte[] Photo { get; set; }
        public DateTime? Date { get; set; }

        public User User { get; set; }
        public virtual ICollection<Like> Likes { get; set; }
    }
}