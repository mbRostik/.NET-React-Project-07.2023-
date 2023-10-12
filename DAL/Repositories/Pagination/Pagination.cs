using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories.Pagination
{
    public class Pagination<T> : List<T>
    {
        public int CurrentPage { get; private set; }

        public int TotalPages { get; private set; }

        public int PageSize { get; private set; }

        public int TotalEntitiesCount { get; private set; }

        public bool HasPrevious => CurrentPage > 1;

        public bool HasNext => CurrentPage < TotalPages;

        public object Metadata => new
        {
            CurrentPage,
            TotalPages,
            PageSize,
            TotalEntitiesCount,
            HasPrevious,
            HasNext
        };

        public async static Task<Pagination<T>> ToPagedListAsync(IEnumerable<T> source, int pageNumber, int pageSize = 5)
        {
            int totalEntitiesCount = source.Count();

            var items = source
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsEnumerable();

            return new(items, totalEntitiesCount, pageNumber, pageSize);
        }

        public Pagination(IEnumerable<T> items, int totalEntitiesCount, int pageNumber, int pageSize)
        {
            CurrentPage = pageNumber;
            PageSize = pageSize;
            TotalEntitiesCount = totalEntitiesCount;
            TotalPages = (int)Math.Ceiling(totalEntitiesCount / (double)pageSize);

            AddRange(items);
        }
    }
}
